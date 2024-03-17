terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.33.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "2.4.1"
    }
  }

}
