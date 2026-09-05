package com.backend.copi.service;

import com.backend.copi.dto.BackupJobRequestDTO;
import com.backend.copi.dto.BackupJobResponseDTO;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.mapper.BackupJobMapper;
import com.backend.copi.repository.BackupExecutionRepository;
import com.backend.copi.repository.BackupJobRepository;
import com.backend.copi.service.utils.CryptoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BackupJobServiceTest {

    @Mock
    private BackupJobMapper backupJobMapper;
    @Mock
    private BackupJobRepository repository;
    @Mock
    private BackupExecutionRepository repositoryExecution;
    @Mock
    private CryptoService cryptoService;
    @Mock
    private BackupExecutionService executionService;
    @Mock
    private BackupStorageService backupStorageService;
    @Mock
    private Clock clock;

    @InjectMocks
    private BackupJobService service;

    @Test
    void updateJobSanitizesChangedName() throws Exception {
        UUID id = UUID.randomUUID();
        BackupJob job = new BackupJob();
        BackupJobRequestDTO request = new BackupJobRequestDTO();
        BackupJobResponseDTO response = new BackupJobResponseDTO();
        request.setName("../../Unsafe Name");

        when(repository.findById(id)).thenReturn(Optional.of(job));
        when(backupStorageService.sanitizeFile(request.getName())).thenReturn("unsafe_name");
        when(repository.save(job)).thenReturn(job);
        when(backupJobMapper.toResponseDto(job)).thenReturn(response);

        BackupJobResponseDTO result = service.updateJob(id, request);

        assertSame(response, result);
        assertEquals("unsafe_name", job.getName());
        verify(backupStorageService).sanitizeFile(request.getName());
    }
}
