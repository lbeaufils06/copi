package com.backend.copi.dto;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DatabaseType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class DefaultsReponse {
    private BackupJob jobDefaults;
    private Map<DatabaseType, String> dumpOptions;
}