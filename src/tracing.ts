// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { diag, DiagConsoleLogger, DiagLogLevel, trace } from '@opentelemetry/api';

// Kích hoạt logging debug để theo dõi quá trình gửi telemetry
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

let sdk: NodeSDK;

/**
 * Hàm initTracing khởi tạo OpenTelemetry SDK để instrument các hoạt động của ứng dụng.
 * Cấu hình này sử dụng exporter OTLP gửi trace đến endpoint của Collector/Agent.
 */
export async function initTracing(): Promise<void> {
  try {
    console.log('Đang khởi tạo OpenTelemetry SDK...');

    // Cấu hình URL endpoint và headers nếu cần
    const traceExporter = new OTLPTraceExporter({
      url: 'http://quang1709.ddns.net:4318/v1/traces', // Endpoint của OpenTelemetry collector
      headers: {}, // Thêm headers nếu cần
      concurrencyLimit: 10, // Số lượng request đồng thời tối đa
    });

    console.log('Đã tạo trace exporter với URL:', 'http://quang1709.ddns.net:4318/v1/traces');

    // Tạo SDK với các cấu hình chi tiết
    sdk = new NodeSDK({
      traceExporter,
      instrumentations: [
        new HttpInstrumentation({
          enabled: true,
          ignoreIncomingRequestHook: () => false, // Tracking tất cả requests
          ignoreOutgoingRequestHook: () => false, // Tracking tất cả outgoing requests
        }),
        new ExpressInstrumentation({
          enabled: true,
        }),
      ],
      resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: 'mos-be-service',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'development',
      }),
    });

    // Bắt đầu SDK
    await sdk.start();
    // eslint-disable-next-line no-console
    console.log('OpenTelemetry SDK đã khởi động thành công.');

    // Đảm bảo Exporter và các instrumentations được kích hoạt đầy đủ
    const tracer = trace.getTracer('init-tracer');
    // Tạo một span nhỏ, hoạt động như một "ping" đến collector
    // để đảm bảo toàn bộ pipeline tracing được khởi động đúng
    tracer.startActiveSpan('init-telemetry', (span) => {
      span.setAttribute('initialization', 'true');
      span.end();
      // eslint-disable-next-line no-console
      console.log('Đã khởi tạo telemetry pipeline');
    });

    // Xử lý tắt SDK khi ứng dụng shutdown
    process.on('SIGTERM', () => {
      shutdownTracing();
    });
    process.on('SIGINT', () => {
      shutdownTracing();
    });
  } catch (error) {
    // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.log('OpenTelemetry SDK đã tắt thành công.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Lỗi khi tắt OpenTelemetry SDK:', error);
    }
  }
}
