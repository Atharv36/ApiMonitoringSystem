export class AnalyticsService {
    constructor(metricsRepo, logger) {
        if (!metricsRepo) {
            throw new Error("Analytics Service requires metrics Repo");
        }

        if (!logger) {
            throw new Error("Analytics Service requires Logger");
        }

        this.metricsRepository = metricsRepo;
        this.logger = logger;
    }

    async getOverallStats(clientId, options = {}) {
        try {
            const { startTime, endTime } = this.parseTimeFilters(options);

            const stats = await this.metricsRepository.getOverallStats(
                clientId,
                startTime,
                endTime
            );

            const totalHits = parseInt(stats.total_hits) || 0;
            const errorHits = parseInt(stats.error_hits) || 0;

            const errorRate =
                totalHits > 0
                    ? (errorHits / totalHits) * 100
                    : 0;

            return {
                totalHits,
                errorHits,
                successHits: totalHits - errorHits,
                errorRate: parseFloat(errorRate.toFixed(2)),
                avgLatency: parseFloat(stats.avg_latency) || 0,
                uniqueServices: parseInt(stats.unique_services) || 0,
                uniqueEndpoints: parseInt(stats.unique_endpoints) || 0,
                timeRange: {
                    start: startTime,
                    end: endTime
                }
            };

        } catch (error) {
            this.logger.error("Error getting overall stats:", error);
            throw error;
        }
    }

    parseTimeFilters(filters = {}) {
        let { startTime, endTime } = filters;

        if (!startTime) {
            startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
        } else {
            startTime = new Date(startTime);
        }

        if (!endTime) {
            endTime = new Date();
        } else {
            endTime = new Date(endTime);
        }

        return {
            startTime,
            endTime
        };
    }

    async getTopEndpoints(clientId, options = {}) {
        try {
            const { limit = 10, startTime } = options;
            const parsedStartTime = startTime ? new Date(startTime) : null;


            const endpoints = await this.metricsRepository.getTopEndpoints(clientId, limit, parsedStartTime);

            return endpoints.map((endpoint) => {
                const totalHits = parseInt(endpoint.total_hits) || 0;
                const errorHits = parseInt(endpoint.error_hits) || 0;

                return {
                    serviceName: endpoint.service_name,
                    endpoint: endpoint.endpoint,
                    method: endpoint.method,
                    totalHits,
                    avgLatency: parseFloat(endpoint.avg_latency) || 0,
                    errorHits,
                    errorRate: totalHits > 0
                        ? parseFloat(((errorHits / totalHits) * 100).toFixed(2))
                        : 0
                };
            });


        } catch (error) {
            this.logger.error("Error getting top endpoint", error);
            throw error
        }
    }


    async getTimeSeries(clientId, filters = {}) {
        try {
            const { serviceName, endpoint, limit = 100, startTime, endTime } = filters;

            const timeFilters = this.parseTimeFilters({ startTime, endTime });

            const metrics = await this.metricsRepository.getMetrics({ clientId, serviceName, endpoint, startTime: timeFilters.startTime, endTime: timeFilters.endTime })

            return metrics.map((metric) => ({
                serviceName: metric.service_name,
                endpoint: metric.endpoint,
                method: metric.method,
                totalHits: parseInt(metric.total_hits),
                errorHits: parseInt(metric.error_hits),
                avgLatency: parseFloat(metric.avg_latency).toFixed(2),
                minLatency: parseFloat(metric.min_latency).toFixed(2),
                maxLatency: parseFloat(metric.max_latency).toFixed(2),
                timeBucket: metric.time_bucket,
            }))
        } catch (error) {
            this.logger.error('Error getting time series:', error);
            throw error;
        }
    }
}