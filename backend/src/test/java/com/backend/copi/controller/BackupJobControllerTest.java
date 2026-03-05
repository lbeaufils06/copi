package com.backend.copi.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import com.backend.copi.dto.BackupJobResponseDTO;
import com.backend.copi.scheduler.BackupJobScheduler;
import com.backend.copi.service.BackupJobService;
import com.backend.copi.service.utils.DefaultService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BackupJobController.class)
@AutoConfigureMockMvc(addFilters = false)
class BackupJobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BackupJobService service;

    @MockitoBean
    private BackupJobScheduler backupJobScheduler;

    @MockitoBean
    private DefaultService defaultService;

    @MockitoBean
    private Clock clock;

    @Test
    void shouldReturnAllJobsWithServerTime() throws Exception {

        Instant fixedInstant = Instant.parse("2025-01-01T10:00:00Z");
        when(clock.instant()).thenReturn(fixedInstant);
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        BackupJobResponseDTO job = new BackupJobResponseDTO();
        job.setId(UUID.randomUUID());

        when(service.getAllJobs()).thenReturn(List.of(job));

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs.length()").value(1))
                .andExpect(jsonPath("$.serverTime").exists());
    }

    @Test
    void shouldReturnJobById() throws Exception {

        UUID id = UUID.randomUUID();
        BackupJobResponseDTO job = new BackupJobResponseDTO();
        job.setId(id);

        when(service.getJobById(id)).thenReturn(job);

        mockMvc.perform(get("/api/jobs/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void shouldCreateJob() throws Exception {

        BackupJobResponseDTO job = new BackupJobResponseDTO();
        job.setId(UUID.randomUUID());

        when(service.createJob(any())).thenReturn(job);

        mockMvc.perform(post("/api/jobs")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(job.getId().toString()));
    }

    @Test
    void shouldUpdateJob() throws Exception {

        UUID id = UUID.randomUUID();
        BackupJobResponseDTO job = new BackupJobResponseDTO();
        job.setId(id);

        when(service.updateJob(eq(id), any())).thenReturn(job);

        mockMvc.perform(put("/api/jobs/" + id)
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void shouldDeleteJob() throws Exception {

        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/jobs/" + id))
                .andExpect(status().isOk());

        verify(service).deleteJob(id);
    }

    @Test
    void shouldStartJob() throws Exception {

        UUID id = UUID.randomUUID();

        mockMvc.perform(post("/api/jobs/" + id + "/start"))
                .andExpect(status().isAccepted());

        verify(backupJobScheduler).runManually(id);
    }

}