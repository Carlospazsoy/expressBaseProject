const { sendGridApiKey } = require('../config');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridApiKey);

const sendEmail = async (email, subject, text) => {
  try {
    const msg = {
      from: 'rokcarlpaz@gmail.com',
      to: email,
      subject: subject,
      text: text,
      //html: "<strong>and easy to do anywhere, even with Node.js, texto con etiquetas strong </strong>" + "<br>" + text,
      /* templateId: 'd-f7049bcba6cd4c54b43865de4afce602',
      substitutions: {
        name: 'Some One',
        city: 'Denver',
      }, */
    };

    await sgMail.send(msg);
    console.log(msg) // depuracion

    // Si el correo se envía correctamente, devolver un objeto con éxito
    return {
      success: true
    };
  } catch (error) {
    console.error(error);

    // Si hay un error al enviar el correo, devolver un objeto con el error
    return {
      success: false
    };
  }
};

module.exports = {
  sendEmail
};
