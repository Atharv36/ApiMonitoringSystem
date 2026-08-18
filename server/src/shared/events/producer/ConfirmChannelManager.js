import { EventEmitter } from "node:events"


export class ConfirmChannelManager extends EventEmitter{
    constructor({rabbitmq , logger}) {
        super();
        if (!rabbitmq) throw new Error("Confirm Channel Manager requires rabbitmq connection manager");

        this._rabbitmq = rabbitmq;
        this.logger = logger;
        this._channel = null;
        this._connecting = false;
        this._connectWaiters = [];
    }
    async getChannel() {
        if (this._channel) return this._channel;
        if (this._connecting) {
            return new Promise((resolve, reject) => {
                this._connectWaiters.push({ resolve, reject });
            })
        }

        return this._connect()

    }

    async _connect() {
        this._connecting = true;
        try {
            let connection
            if (this._rabbitmq.connection) {
                connection = this._rabbitmq.connection
            } else {
                await this._rabbitmq.connect();
                if (!this._rabbitmq.connection) {
                    throw new Error("Failed to obtain RabbitMQ connection")
                }

                connection = this._rabbitmq.connection
            }

            const confirmChannel = await connection.createConfirmChannel();

            confirmChannel.on('drain', () => this.emit('drain'));

            confirmChannel.on('close', () => {
                this.logger.warn('[ChannelManager] confirm channel closed unexpectedly')
                this._channel = null;
            })

            confirmChannel.on('error', (err) => {
                this.logger.warn('[ChannelManager] confirm channel error', {
                    error: err.message,
                    stack:err.stack,
                    code:err.code,
                })  
                this._channel = null;
                this.emit('error',err)
            })

            this._channel = confirmChannel;

            this.logger.info('[ChannelManager] confirm channel ready')

            for(let w of this._connectWaiters) w.resolve(confirmChannel);
            this._connectWaiters = [];
            return confirmChannel


        } catch (error) {
            
            for(let w of this._connectWaiters) w.reject(error);
            this._connectWaiters = [];
            throw error

        } finally {
            this._connecting = false;
        }
    }


}