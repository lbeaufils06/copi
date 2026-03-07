export async function downloadExecutionFile(exec) {
  const endpoints = [
    `/api/executions/${exec.id}/download`,
    `/api/executions/download/${exec.id}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { credentials: "include" });

      if (!response.ok) {
        if (response.status === 404) continue;
        throw new Error(`Download failed (${response.status})`);
      }

      const blob = await response.blob();
      const fileName = extractFileName(response, exec.fileName || `backup-${exec.id}`);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download error", error);
    }
  }

  return false;
}

function extractFileName(response, fallbackName) {
  const header = response.headers.get("content-disposition");
  if (header) {
    const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

    const asciiMatch = /filename="?([^";]+)"?/i.exec(header);
    if (asciiMatch?.[1]) return asciiMatch[1];
  }

  return fallbackName || "backup-file";
}
