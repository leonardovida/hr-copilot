import boto3


def lambda_handler(event, context):
    client = boto3.client("ecs")
    resp = client.update_service(
        cluster="tc-cluster",
        service="tc-talent-copilot",
        desiredCount=0,  # Set to 0 for stopping the service
    )
    if resp["service"]["desiredCount"] == 0:
        return {"message": "Service updated successfully"}
    else:
        return {"message": "Service not updated"}
