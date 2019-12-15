const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'hungree.skeleton@gmail.com',
        subject: 'Welcome to the App',
        text: `Welcome to the app, ${name}. `  //back ticks used for template strings
    });
};

const sendDepartureEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hungree.skeleton@gmail.com',
        subject: 'Before you go...',
        text: `We're sad to see you go, ${name}. Please let us know if there was anyhting we could have done to enhance your experience.`
    })
}

// sgMail.send({
//     to: 'hungree.skeleton@gmail.com',
//     from: 'hungree.skeleton@gmail.com',
//     subject: 'first email',
//     text: 'test email text'
// });

module.exports = {
    sendWelcomeEmail,        //shorthand for sendWelcomeEmail: sendWelcomeEmail
    sendDepartureEmail
}