# provider "acme" {
#   server_url = "https://acme-v02.api.letsencrypt.org/directory"
# }

# resource "aws_route53_record" "www" {
#   zone_id = aws_route53_zone.primary.zone_id
#   name    = "www.your-domain.com"
#   type    = "A"
#   ttl     = "300"
#   records = [aws_eip.lb.public_ip]
# }

# resource "acme_registration" "reg" {
#   account_key_pem = "${file("${path.module}/pem/account.key")}"
#   email_address   = "leonardo.vida@databuildcompany.com"
# }

# resource "acme_certificate" "cert" {
#   account_key_pem         = "${acme_registration.reg.account_key_pem}"
#   common_name             = "your-domain.com"
#   subject_alternative_names = ["www.your-domain.com"]

#   dns_challenge {
#     provider = "route53"
#   }
# }
