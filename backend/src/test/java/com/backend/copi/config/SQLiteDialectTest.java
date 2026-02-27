package com.backend.copi.config;

import org.hibernate.dialect.Dialect;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SQLiteDialectTest {

    @Test
    void shouldInstantiateSQLiteDialect() {

        SQLiteDialect dialect = new SQLiteDialect();

        assertThat(dialect).isNotNull();
        assertThat(dialect).isInstanceOf(Dialect.class);
    }
}