package com.backend.copi.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.service.BackupExecutionService;

@WebMvcTest(BackupExecutionController.class)
@AutoConfigureMockMvc(addFilters = false) // désactive security
class BackupExecutionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BackupExecutionService executionService;

    @Test
    void shouldReturnExecutionsByJob() throws Exception {

        UUID jobId = UUID.randomUUID();

        BackupExecution execution = new BackupExecution();
        execution.setId(UUID.randomUUID());

        when(executionService.getExecutionsByJob(jobId))
                .thenReturn(List.of(execution));

        mockMvc.perform(get("/api/executions/" + jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void shouldReturnAllExecutions() throws Exception {

        BackupExecution execution = new BackupExecution();
        execution.setId(UUID.randomUUID());

        when(executionService.getAllExecutions())
                .thenReturn(List.of(execution));

        mockMvc.perform(get("/api/executions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}