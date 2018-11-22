const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  const unknownUser = !(req.user);

  res.render('contact', {
    title: 'Contact',
    unknownUser,
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  let fromName;
  let fromEmail;
  if (!req.user) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
  }
  req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  if (!req.user) {
    fromName = req.body.name;
    fromEmail = req.body.email;
  } else {
    fromName = req.user.profile.name || '';
    fromEmail = req.user.email;
  }

  const mailOptions = {
    to: 'marcoswca1@gmail.com',
    from: `${fromName} <${fromEmail}>`,
    subject: 'Contact Form | Xeroqueo',
    text: req.body.message
  };

  return sgMail.send(mailOptions)
    .then(() => {
      req.flash('success', {
        msg: 'Email has been sent successfully!'
      });
      res.redirect('/contact');
    })
    .catch((err) => {
      if (err.message === 'self signed certificate in certificate chain') {
        console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
        return sgMail.send(mailOptions);
      }
      console.log('ERROR: Could not send contact email after security downgrade.\n', err);
      req.flash('errors', {
        msg: 'Error sending the message. Please try again shortly.'
      });
      return false;
    })
    .then((result) => {
      if (result) {
        req.flash('success', {
          msg: 'Email has been sent successfully!'
        });
        return res.redirect('/contact');
      }
    })
    .catch((err) => {
      console.log('ERROR: Could not send contact email.\n', err);
      req.flash('errors', {
        msg: 'Error sending the message. Please try again shortly.'
      });
      return res.redirect('/contact');
    });
};