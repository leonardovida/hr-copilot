import boto3


def lambda_handler(event, context):
    client = boto3.client("ecs")
    resp = client.update_service(
        cluster="tc-cluster",
        service="tc-talent-copilot",
        desiredCount=1,  # Set to desired number for starting
    )
    if resp["service"]["desiredCount"] == 1:
        return {"message": "Service updated successfully"}
    else:
        return {"message": "Service not updated"}
