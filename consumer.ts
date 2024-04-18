import * as amqp from "amqplib";
import axios from "axios";


const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  "amqps://guuiiotx:Gz9SMj0AspY5hXgtm0MDweuxEXfDLVLv@gull.rmq.cloudamqp.com/guuiiotx";

const sourceQueue = "primercola";
const secondApiUrl = "https://api2event.onrender.com/user-received/process-message";

async function consumeAndForward() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(sourceQueue, { durable: true });

    channel.consume(
      sourceQueue,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log("Mensaje recibido:", messageContent);

          // Envía el mensaje a la segunda API
         try {
            await axios.post(secondApiUrl, { message: messageContent });
            console.log("Mensaje enviado a la segunda API");
          } catch (error) {
            console.error("Error al enviar el mensaje a la segunda API:", error);
          }

          // Asegúrate de confirmar la recepción del mensaje
          channel.ack(msg);
        }
      },
      { noAck: false } // El mensaje se confirmará después de ser procesado
    );
  } catch (error) {
    console.error("Error en la función consumeAndForward:", error);
  }
}

consumeAndForward();
