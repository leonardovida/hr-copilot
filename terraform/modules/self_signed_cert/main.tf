resource "tls_private_key" "this" {
  algorithm = "RSA"
}

resource "tls_self_signed_cert" "this" {
  private_key_pem = tls_private_key.this.private_key_pem
  subject {
    common_name         = var.subject.common_name
    organization        = var.subject.organization
    organizational_unit = var.subject.organizational_unit
  }

  validity_period_hours = 24 * 30
  early_renewal_hours   = 24

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

resource "aws_acm_certificate" "this" {
  private_key      = tls_private_key.this.private_key_pem
  certificate_body = tls_self_signed_cert.this.cert_pem
  tags             = var.tags

  lifecycle {
    create_before_destroy = true
  }
}
