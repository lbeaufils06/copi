package com.backend.copi.config;

import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.DatabaseVersion;

public class SQLiteDialect extends Dialect {

    public SQLiteDialect() {
        super(DatabaseVersion.make(3, 0));
    }
}
