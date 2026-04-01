type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  [key: string]: unknown;
}

class Logger {
  private format(level: LogLevel, payload: LogPayload | string) {
    const isString = typeof payload === "string";
    const base = {
      timestamp: new Date().toISOString(),
      level,
      message: isString ? payload : payload.message,
    };

    const extra = isString ? {} : { ...payload, message: undefined };
    return JSON.stringify({ ...base, ...extra });
  }

  debug(payload: LogPayload | string) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", payload));
    }
  }

  info(payload: LogPayload | string) {
    console.info(this.format("info", payload));
  }

  warn(payload: LogPayload | string) {
    console.warn(this.format("warn", payload));
  }

  error(payload: LogPayload | string, error?: Error | unknown) {
    const errorDetails = error instanceof Error 
      ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { rawError: error };

    const mergedPayload = typeof payload === "string" 
      ? { message: payload, ...errorDetails }
      : { ...payload, ...errorDetails };

    console.error(this.format("error", mergedPayload));
  }
}

export const logger = new Logger();
