package com.backend.copi.service.dump;

import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.util.concurrent.TimeUnit;

@Slf4j
public abstract class AbstractDumpService implements DatabaseDumpService {

    protected String runProcess(ProcessBuilder pb,
                                String filePath,
                                String label,
                                boolean redirectOutput) {

        File file = new File(filePath);

        File parent = file.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }

        try {

            if (redirectOutput) {
                pb.redirectOutput(file);
            }

            Process process = pb.start();

            StringBuilder errorOutput = new StringBuilder();

            Thread errorReader = new Thread(() -> {
                try (BufferedReader br =
                             new BufferedReader(
                                     new InputStreamReader(process.getErrorStream()))) {

                    String line;
                    while ((line = br.readLine()) != null) {
                        errorOutput.append(line).append("\n");
                    }

                } catch (IOException e) {
                    log.error("Error reading process stderr", e);
                }
            });

            errorReader.setDaemon(true);
            errorReader.start();

            boolean finished = process.waitFor(30, TimeUnit.MINUTES);

            if (!finished) {

                process.destroyForcibly();

                if (file.exists()) {
                    file.delete();
                }

                log.error("{} timeout", label);
                return null;
            }

            errorReader.join();

            int exitCode = process.exitValue();

            if (exitCode != 0) {

                if (file.exists()) {
                    file.delete();
                }

                log.error("{} failed (exitCode={})\n{}", label, exitCode, errorOutput);
                return null;
            }

            if (!file.exists() || file.length() == 0) {

                if (file.exists()) {
                    file.delete();
                }

                log.error("{} produced empty file", label);
                return null;
            }

            return file.getAbsolutePath();

        } catch (Exception e) {

            log.error("{} execution error", label, e);

            if (file.exists()) {
                file.delete();
            }

            return null;
        }
    }

    // canConnect: Handles can connect in the current backend workflow.
    protected boolean canConnect(String host, int port, int timeoutMs) {

        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
