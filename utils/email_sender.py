"""
Adaptador para envío de correos usando smtplib.
Configura las variables de entorno en tu .env:

    MAIL_SERVER=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USERNAME=tu_correo@gmail.com
    MAIL_PASSWORD=tu_contraseña_de_aplicacion
    MAIL_FROM=tu_correo@gmail.com
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

MAIL_SERVER   = os.getenv("MAIL_SERVER",   "smtp.gmail.com")
MAIL_PORT     = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM     = os.getenv("MAIL_FROM",     MAIL_USERNAME)


def send_email(to: str, subject: str, html_body: str) -> None:
    """Envía un correo HTML usando SMTP con TLS."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = MAIL_FROM
    msg["To"]      = to

    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to, msg.as_string())
