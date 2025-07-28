// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

let sdk: NodeSDK;

/**
 * Hàm initTracing khởi tạo OpenTelemetry SDK để instrument các hoạt động của ứng dụng.
 * Cấu hình này sử dụng exporter OTLP gửi trace đến endpoint của Collector/Agent.
 */
export async function initTracing() {
  try {
    const traceExporter = new OTLPTraceExporter({
      url: 'http://quang1709.ddns.net:4318/v1/traces', // Chỉnh sửa URL nếu cần
    });

    const sdk = new NodeSDK({
      traceExporter,
      instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'my-nest-service',
      }),
    });

    await sdk.start();
    // eslint-disable-next-line no-console
    console.log('OpenTelemetry SDK đã khởi động thành công.');

    // Xử lý tắt SDK khi ứng dụng shutdown
    process.on('SIGTERM', () => {
      shutdownTracing();
    });
    process.on('SIGINT', () => {
      shutdownTracing();
    });
  } catch (error) {
    console.error('Không thể khởi động OpenTelemetry SDK:', error);
  }
}

/**
 * Hàm shutdownTracing để tắt SDK một cách an toàn khi ứng dụng shutdown
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log('OpenTelemetry SDK đã tắt thành công.');
    } catch (error) {
      console.error('Lỗi khi tắt OpenTelemetry SDK:', error);
    }
  }
}
