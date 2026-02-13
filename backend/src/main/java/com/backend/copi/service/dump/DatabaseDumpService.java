package com.backend.copi.service.dump;

import com.backend.copi.entity.BackupJob;

public interface DatabaseDumpService {

    boolean supports(String dbType);

    String executeDump(BackupJob job) throws Exception;
}
