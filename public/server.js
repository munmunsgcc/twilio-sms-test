const express = require("express");
const app = express();
const port = 3000;
const cred = require("token.json");
const client = require("twilio")(cred.sid, cred.token);
const MessagingResponse = client.twiml.MessagingResponse;

/**
 * Full API: https://www.twilio.com/docs/sms/api/message-resource?code-sample=code-update-a-message&code-language=Node.js&code-sdk-version=3.x
 * The idea of sending SMS is the same as Whatsapp. The code is almost the same as well.
 * However, you cannot send MMS outside of US and Canada.
 * Remember to add country code! All phone numbers are sample only.
 * You can use text only, or use TwiML to build a message.
 * PS: NumSegments is the total SMS needed to deliver or send the body to recipient.
 * 1 sms = 160 GSM/70 UCS2
 *
 * https://www.twilio.com/docs/glossary/what-is-gsm-7-character-encoding
 * https://www.twilio.com/docs/glossary/what-is-ucs-2-character-encoding
 * To check how the SMS is split, do so here: http://chadselph.github.io/smssplit/
 */

app.post("/send", (req, res) => {
  // Send to 1 recipient
  client.messages
    .create({
      body: "This is a message",
      from: "+15017122661",
      to: "+15558675310"
      // The max you are willing to pay for an SMS. Will fail if over the limit.
      // maxPrice: 00.00,
      // You can specify what link to send to if the status is updated.
      //statusCallback: 'sgcodecampus.com/status'
    })
    .then(message => {
      console.log(message);
    });

  // Send to multiple recipient
  client.messages
    .create({
      body: "This is a message",
      from: "+15017122661",
      to: ["+15558675310", "+15558675309"]
    })
    .then(message => {
      console.log(message);
    });

  res.end();
});

// Add a webhook so this piece of code will send a SMS using TwiML, which is a lib
// that creates XML content. Twilio will understand the xml! PS: This is not usable for Whatsapp replies.
app.post("/reply", (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message("This is a reply");

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log("Listening to port 3000!");
});

// Add a webhook to keep track of your SMS status.
// There are 5 statuses: queued, failed, sent, delivered, undelivered.
// It goes from accepted -> queued -> sending -> sent -> receiving -> received -> delivered.
// The given object always returns a MessageSid so you know which message it is
// referring to.
app.post("/status", (req, res) => {
  const {
    body: { MessageSid, MessageStatus }
  } = req;

  console.log("Sid: ", MessageSid, "status: ", MessageStatus);

  res.end();
});

// You can look for previously sent or received messages
app.post("/history", () => {
  // All messages
  client.messages.each(messages => {
    console.log(messages);
  });

  // 1 message
  // Get using MessageSid
  client
    .messages("MMdasdsadsdaqweq242")
    .fetch()
    .then(message => {
      console.log(message);
    });

  // Find matching messages with param
  // You can mix and match these params
  client.messages.each(
    {
      // List all message sent on this date
      dateSent: new Date(Date.UTC(2019, 3, 11, 0, 0, 0)),
      // List all messages sent before this date
      // dateSentBefore: new Date(Date.UTC(2019, 3, 11, 0, 0, 0))
      // List all messages sent after this date
      // dateSentAfter: new Date(Date.UTC(2019, 4, 11, 0, 0, 0))
      // List messages sent from and to these numbers
      from: "+12131313",
      to: "+21213232"
    },
    messages => {
      console.log(messages);
    }
  );

  // Delete a message using MessageSid
  // You cannot delete an in-progress SMS!
  client
    .messages("MMfafr35325353")
    .remote()
    .then(message => {
      console.log(message);
    });

  // Redact a message, just pass in the body empty then can di
  // But the message will still be in the history list
  client
    .messages("MMdwerqr21r245")
    .update({ body: "" })
    .then(message => {
      console.log(message);
    });
});
