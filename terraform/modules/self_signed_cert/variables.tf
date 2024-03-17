variable "tags" {
  type    = map(string)
  default = {}
}

variable "subject" {
  type = object({
    common_name         = string
    organization        = string
    organizational_unit = string
  })
  default = {
    common_name         = "example.com"
    organization        = "Example, Inc"
    organizational_unit = "Engineering"
  }
}
