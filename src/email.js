import emailjs from '@emailjs/browser';

const sendEmail = (toEmail, toName, message, enterpriseName, link) => {
  const templateParams = {
    to_name: toName, // Nome do destinatário
    to_email: toEmail, // E-mail do destinatário
    message: message, // Mensagem personalizada
    subject: `Reagentamento no ${enterpriseName}`,
    link: link,
    company_name: enterpriseName,
  };

  emailjs
    .send(
      process.env.REACT_APP_EMAIL_SERVICE_ID,
      process.env.REACT_APP_EMAIL_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAIL_USER_ID
    )
    .then(
      (response) => {
        console.log('E-mail enviado com sucesso!', response.status, response.text);
      },
      (error) => {
        console.error('Erro ao enviar e-mail:', error);
      }
    );
};

export default sendEmail;