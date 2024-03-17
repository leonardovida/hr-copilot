output "acm_certificate_arn" {
  value = aws_acm_certificate.this.arn
}

output "acm_certificate_id" {
  value = aws_acm_certificate.this.id
}

output "acm_certificate_domain_name" {
  value = aws_acm_certificate.this.domain_name
}
