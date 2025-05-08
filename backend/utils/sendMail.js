const nodemailer = require("nodemailer");
const TemplateEmail = require("./templateEmail");

class SendMail {
    static async sendMail(to, subject, name, token) {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP,
            port: process.env.SMTP_PORT, 
            secure: true, 
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        console.log({
            to,
            subject,
            name
        })

        const verificationLink = `${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(to)}&token=${encodeURIComponent(token)}`;

        let mailOptions = {
            from: `"Gloobal Jobs" <${process.env.EMAIL}>`,
            to: to, 
            subject: subject,
            html: TemplateEmail.template(name, verificationLink),
            // text: 'Hello text'
        };

        try {
            let info = await transporter.sendMail(mailOptions);
            console.log({
                verificationLink,
                info
            })
            console.log('Correo enviado: %s', info.messageId);
            return info.messageId
        } catch (error) {
            console.error('Error al enviar el correo: ', error);
        }
    }
}
module.exports = SendMail;