import ampq from "amqplib";
import config from "./index.js";
import logger from "./logger.js";

class RabbitMQConnection {
    constructor() {
        this.channel = null;
        this.connection = null;
        this.isConnecting = false;
    }
        async connect(){
            if (this.channel) return this.channel;
            if (this.isConnecting) {
                //if someone trying to connect
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (!this.isConnecting) {
                            clearInterval(checkInterval); 
                            resolve();
                        }
                    },100)
                })
                return this.channel
                
            }



            try {
                this.isConnecting = true;
                logger.info("Connecting to RabbitMQ", config.rabbitmq.url)
                
                this.connection = await ampq.connect(config.rabbitmq.url)
                this.channel = await this.connection.createChannel();

                //creating key || Queue Name
                const dlqName = `${config.rabbitmq.queue}.dlq`

                //DLQUEUE
                await this.channel.assertQueue(dlqName, {
                    durable: true
                });

                //Normal Queue
                await this.channel.assertQueue(config.rabbitmq.queue, {
                    durable: true,
                    arguments: {
                        "x-dead-letter-exchange": "",
                        "x-dead-letter-routing-key": dlqName
                    }
                })

                    logger.info("RabbitMQ connected queue : ",config.rabbitmq.queue)

                this.connection.on("close", () => {
                    logger.warn("RabbitMQ Connection Closed")
                    this.connection = null;
                    this.channel = null;

                })
                

                this.connection.on("error", (error) => {
                    logger.error("RabbitMQ Connection Error",error)
                    this.connection = null;
                    this.channel = null;

                    })

                this.isConnecting = false;

                return this.channel


            } catch (error) {
                this.isConnecting = false;
                logger.error("RabbitMQ Connection Error", error)
                throw error

                
            }
        }


        getChannel(){
            return this.channel;
        }


        getStatus(){
            if (!this.connection || !this.channel) return "disconnect";
            if (this.connection?.closing) return "closing";
            return "connected"
        }

        async close(){
            try {
                if (this.channel) {
                    await this.channel.close();
                    this.channel = null;
                }
                if (this.connection) {
                    await this.connection.close();
                    this.connection = null;
                }
                logger.info("RabbitMQ connection closed")
            } catch (error) {
                logger.error("Error in closing rabbitmq connection",error)

            }
        }



    
}


export default new RabbitMQConnection()