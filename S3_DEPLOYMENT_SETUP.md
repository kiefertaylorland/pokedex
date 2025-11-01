# S3 Deployment Setup Guide

This guide will help you set up automatic deployment of your Pokedex to AWS S3 using GitHub Actions.

## Prerequisites

- AWS Account
- GitHub repository for this project
- Basic understanding of AWS S3 and IAM

## Step 1: Create an S3 Bucket

1. Log into AWS Console
2. Navigate to S3
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `my-pokedex-app`)
5. Select your preferred region
6. **Uncheck "Block all public access"** (for website hosting)
7. Click "Create bucket"

## Step 2: Configure S3 Bucket for Static Website Hosting

1. Select your bucket
2. Go to "Properties" tab
3. Scroll to "Static website hosting"
4. Click "Edit"
5. Enable static website hosting
6. Set index document: `index.html`
7. Set error document: `index.html`
8. Save changes
9. Note the bucket website endpoint URL

## Step 3: Add Bucket Policy

1. Go to "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

5. Save changes

## Step 4: Create IAM User for GitHub Actions

1. Navigate to IAM in AWS Console
2. Click "Users" → "Add users"
3. User name: `github-actions-deployer`
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Click "Create policy"
8. Use JSON tab and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME",
                "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            ]
        }
    ]
}
```

9. Name the policy `GitHubActionsS3Deploy`
10. Create the policy
11. Go back to user creation and attach this policy
12. Complete user creation
13. **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

## Step 5: Add GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add these secrets:

   - **AWS_ACCESS_KEY_ID**: Your IAM user access key ID
   - **AWS_SECRET_ACCESS_KEY**: Your IAM user secret access key
   - **AWS_REGION**: Your bucket region (e.g., `us-east-1`)
   - **S3_BUCKET_NAME**: Your bucket name (e.g., `my-pokedex-app`)

## Step 6: Test the Deployment

1. Commit and push the workflow file to your repository:
   ```bash
   git add .github/workflows/deploy-to-s3.yml
   git commit -m "Add S3 deployment workflow"
   git push origin main
   ```

2. Go to your GitHub repository
3. Click "Actions" tab
4. Watch the deployment workflow run
5. Once complete, visit your S3 website endpoint URL

## Optional: CloudFront CDN Setup

For better performance and HTTPS support:

1. Create a CloudFront distribution pointing to your S3 bucket
2. Add the distribution ID as a GitHub variable:
   - Go to "Settings" → "Secrets and variables" → "Actions" → "Variables"
   - Add variable: **CLOUDFRONT_DISTRIBUTION_ID**
3. The workflow will automatically invalidate the cache on deployments

## Troubleshooting

### Deployment fails with "Access Denied"
- Check IAM user has correct permissions
- Verify bucket name in secrets matches actual bucket name
- Ensure bucket policy allows public read access

### Website shows 403 Forbidden
- Check bucket policy is correctly configured
- Verify "Block all public access" is disabled
- Ensure index.html exists in bucket root

### Changes not appearing
- If using CloudFront, cache may need time to invalidate
- Check if workflow actually ran successfully in Actions tab
- Verify files were uploaded to S3 bucket

## Workflow Details

The GitHub Actions workflow:
- Triggers on push to main/master branches
- Triggers on merged pull requests to main/master
- Syncs only necessary files (excludes Python files, tests, etc.)
- Uses `--delete` flag to remove old files from S3
- Optionally invalidates CloudFront cache

## Security Notes

- Never commit AWS credentials to your repository
- Always use GitHub Secrets for sensitive data
- Follow principle of least privilege for IAM permissions
- Consider enabling S3 bucket versioning for backup
- Use CloudFront with SSL/TLS for production deployments

## Cost Considerations

- S3 storage: ~$0.023 per GB per month
- S3 requests: Minimal cost for static website
- CloudFront (optional): Free tier available, then pay-as-you-go
- Expected monthly cost for this project: < $1 USD

## Next Steps

Once deployed, your Pokedex will automatically update whenever you:
- Push commits to main/master branch
- Merge pull requests into main/master

No manual deployment needed! 🚀
