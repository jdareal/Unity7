# 🚀 AWS DEPLOYMENT GUIDE - PRACTICAL SERVER SETUP

## 📋 MINIMAL RESOURCE REQUIREMENTS
- **EC2 Instance**: t3.medium (2 vCPU, 4GB RAM) - $30/month
- **Storage**: 20GB EBS - $2/month
- **Load Balancer**: Application Load Balancer - $16/month
- **Total**: ~$50/month for production-ready setup

## 🔧 STEP-BY-STEP DEPLOYMENT

### 1. EC2 Instance Setup
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git
```

### 2. Deploy Your Code
```bash
# Clone your repository
git clone https://github.com/yourusername/recursive-learning-engine.git
cd recursive-learning-engine

# Install dependencies
npm install

# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
EOF

# Start with PM2
pm2 start index.js --name "recursive-engine"
pm2 save
pm2 startup

# Enable auto-restart
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

### 3. Configure Load Balancer
```bash
# Install and configure Nginx
sudo amazon-linux-extras install nginx1 -y

# Configure Nginx
sudo tee /etc/nginx/conf.d/recursive-engine.conf << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Set Up SSL Certificate
```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Monitoring Setup
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Basic monitoring configuration
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "metrics": {
        "namespace": "RecursiveEngine",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
```

## 💰 COST OPTIMIZATION

### Development Environment ($15/month)
- t3.micro instance (1 vCPU, 1GB RAM)
- 10GB storage
- No load balancer needed

### Production Environment ($50/month)
- t3.medium instance (2 vCPU, 4GB RAM)
- 20GB storage
- Application Load Balancer
- CloudWatch monitoring

### Scale-Up Options
- **High Traffic**: t3.large ($70/month)
- **Enterprise**: Multiple instances with auto-scaling
- **Global**: CloudFront CDN for worldwide distribution

## 🔒 SECURITY BEST PRACTICES

```bash
# Update security groups
# Allow only:
# - Port 22 (SSH) from your IP
# - Port 80/443 (HTTP/HTTPS) from anywhere
# - All outbound traffic

# Create IAM role for EC2 with minimal permissions
# Only CloudWatch and Systems Manager access

# Regular updates
sudo yum update -y
npm audit fix

# Backup strategy
# Automated EBS snapshots daily
# Code backups to S3
```

## 📊 MONITORING & ALERTS

### Key Metrics to Watch
- CPU utilization > 80%
- Memory usage > 85%
- Disk space > 90%
- Response time > 2 seconds
- Error rate > 5%

### CloudWatch Alarms
```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPUUtilization" \
  --alarm-description "Alarm when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🚀 DEPLOYMENT AUTOMATION

### GitHub Actions Workflow
```yaml
name: Deploy to AWS
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.AWS_HOST }}
        username: ec2-user
        key: ${{ secrets.AWS_PRIVATE_KEY }}
        script: |
          cd recursive-learning-engine
          git pull origin main
          npm install
          pm2 restart recursive-engine
```

## 📈 SCALING STRATEGY

### Phase 1: Single Server ($50/month)
- Handle 100-1000 requests/day
- Perfect for MVP and testing

### Phase 2: Load Balanced ($150/month)
- 2 servers behind load balancer
- Handle 10,000+ requests/day
- Auto-scaling capability

### Phase 3: Multi-Region ($500+/month)
- Global deployment
- CDN integration
- Database replication
- Enterprise-ready

## 🎯 SUCCESS METRICS

### Technical KPIs
- 99.9% uptime
- < 500ms average response time
- < 1% error rate
- Zero security incidents

### Business KPIs
- Monthly active users
- API call volume
- Revenue per user
- Customer satisfaction score

## 🔧 TROUBLESHOOTING

### Common Issues
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs recursive-engine

# Check Nginx status
sudo systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
top
```

### Emergency Procedures
1. **High CPU**: Scale up instance or optimize code
2. **Memory leak**: Restart PM2 process
3. **Disk full**: Clean logs and temporary files
4. **SSL expiry**: Renew certificate with certbot
5. **Database issues**: Check RDS status and connections