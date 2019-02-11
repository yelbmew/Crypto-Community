[![forthebadge](https://forthebadge.com/images/badges/made-with-python.svg)](https://forthebadge.com)

## About
This project was done over the course of Cloud Computing Course Code: COSC2626  <br /> 
and was originally hosted on my Github student account. The Open-Ended Assignment was <br /> 
to let students to make use of their cloud infrastructure skill and to <br />
demostrate the understanding of the cloud workflow. Below implementation was part
of the assignment submission
___
## Cloud Infrastructure Overview
![Cloud Architecture](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/cloudArchitecture.png)

#### Web Application Implementation:
  - Python Flask Framework
    - RESTful API to SQL database

#### Configuration Management Tools:
  - Puppet Enterprise

#### Amazon Web Services

   | Resources                                           | Descriptions                       |
   | --------------------------------------------------- | ---------------------------------- |
   | Cloudwatch                                          | Logs monitoring from EC2 Instnaces |
   | Cloudformation                                      | Launch AWS resources               |
   | EC2 Micro with Ubuntu                               | Host Flask web application         |
   | EC2 Medium with Red Hat Enterprise Linux            | Host Puppet Master                 |


#### Google

   | Resources      | Descriptions                                                             |
   | -------------- | ------------------------------------------------------------------------ |
   | Google Cloud Platform - CloudSQL | Users database                                         |
   | Google Data Studio | Graph Visualization to overview number of user <br />sign up per day |

#### APIs
  1. Google Maps
  2. Blockchain
___

## Project Overview
The idea behind this application is to bring anyone in Melbourne who hold  
a strong passion in Bitcoin. The inspiration was came from [MeetUp](https://www.meetup.com).<br />
Some of the main features from the apps are:<br />  

Homepage will present the user latest exchange rate of Bitcoin in different currency utilizing Blockchain API. <br />
User can search the location (Google Maps API) to find the nearest Meetup point.<br />
User can also choose to subscribe to latest weekly news that will send out by admin.
___
## Developer Manual
This manual will provide user a step-by-step guide to configure tools they need to deploy the stacks.
My aim is to make this guide as beginner-friendly as possible

#### Pre-check before installing AWS CLI
I suggest install AWS CLI through python package manager PIP as it will guarantee the latest
stable release. I also encourage to stick with python3 instead of python2 as it will deprecate in 10 months
as of this writing. You can check python2.7 retirement at https://pythonclock.org
By verify if you have python3 install on your machine type
```bash
which python3
```

If you have python3 installed, check if pip3 package manager is install by typing
```bash
which pip3
```

If both command return a valid path means you are good to go. If not, please follow one of the 
instruction below depend on your platform.

#### Linux Distribution
#### Arch
```bash
sudo pacman -S python36 python-pip
```
#### Ubuntu
```bash
sudo apt-get -y install python3 python3-pip
```
#### MAC OS
Homebrew is a great package manager that don’t comes with Mac OS. Install Homebrew with
```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

and then install python3 using Homebrew and pip3 will install alongside
```bash
brew install python
```

Install AWS CLI using pip3
```bash
pip3 install awscli --upgrade --user
```

Add the path to the executable file of the PATH variable
```bash
export PATH=~/.local/bin:$PATH
```

To make it persistent you need to add the path to your SHELL config. In my case it will be
`~/.bashrc`. If you are using zsh then it will be `~/.zshrc`. To find out which SHELL
you are using type
```bash
echo $SHELL
```
Don't forget to reload your SEHLL config by typing
```bash
source ~/.bashrc
# OR
source ~/.zshrc
```

Verify if AWS is installed successfully by typing the command below and It will return a valid path.
```bash
which aws
```
#### Setup AWS CLI to connect to your account
By doing that you need Access Keys ID and Secret Access Key. You can retrieve it by login into
your AWS web console. To configure type
```bash
aws configure

# The output after setting up
AWS Access Key ID [****************UAVQ]:
AWS Secret Access Key [****************QPEq]:
Default region name [ap-southeast-2]:
Default output format [json]:
```

#### Generate SSH key pair for AWS
```bash
ssh-keygen -t rsa -b 4096 -C "your@email.com" -f $HOME/.ssh/give-a-nice-name
```

#### Import key pair to AWS
```bash
aws ec2 import-key-pair --key-name giveaname --public-key-material
file://~/.ssh/give-a-nice-name.pub
```

#### Retrieve Key Pair from AWS
this come in handy when you have multiple aws profile to manage
```bash
aws ec2 describe-key-pairs
```

#### Retrieve Subnets and VPC Id
We are going to need VPCId and SubnetId when we launch our Cloudformation stack
```bash
aws ec2 describe-subnets | grep -iE 'subnetid|vpcid' -m2
```
#### Launch AWS Cloudformation stack
```bash
aws cloudformation create-stack --stack-name stackname \
--template-body file://cpHost.json --parameters \
ParameterKey=VpcId,ParameterValue=vpc-61ja151e \
ParameterKey=SubnetId,ParameterValue=subnet-6c420000 \
ParameterKey=KeyName,ParameterValue=giveaname
```
#### Check the status of the Cloudformation stack
```bash
aws cloudformation describe-stack-events --stack-name stackname
```

#### Configure CloudWatch Logs Agent
Create an IAM role under IAM tab inside AWS Console and attach to the EC2 instance and
please don’t forget to include the policy below which allow cloudwatch to stream the logs back to
AWS console.
```json
{
  "Version": "2012-10-17",
  "Statement": [
  {
    "Effect": "Allow",
    "Action": [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents",
    "logs:DescribeLogStreams"
  ],
  "Resource": [
    "arn:aws:logs:*:*:*"
   ]
  }
 ]
}
```

#### Retrieve PublicDNS
Retrieve public DNS by typing
```bash
aws ec2 describe-instances | grep -im 1 PublicDnsName
```

#### Now SSH Into EC2 Instance for configuring
```bash
ssh -i ~/.ssh/give-a-name ubuntu@ec2-00-0-000-00.compute-1.amazonaws.com
```

#### Install CloudWatch Logs Agent
```bash
curl -O https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py

# remember to set region to ap-southeast-2 (Sydney)
sudo python ./awslogs-agent-setup.py --region ap-southeast-2
```
<br />
Now follow the prompt to complete the installation. Open your AWS console and under CloudWatch and you
will be able to see the logs that get stream from the instance. 

#### Puppet on t2 Medium RHEL Instance
I decided to take this approach by including configuration management tools just to mirror the real
world. Think of a scenario where you have 100 of servers to manage, by ssh into each one
and install the packages would be a really by idea.

Launch the Cloudformation cpMaster.json stack and ssh into the instnace using
the steps above.

Download Puppet Enterprise from 
`https://puppet.com/download-puppet-enterprise/thank-you`

#### Copy and Install Puppet on server
```bash
scp -ri ~/.ssh/give-a-nice-name
~/Downloads/puppet-enterprise-2018.1.2-el-7-x86_64.tar.gz
ec2-user@ec2-13-237-72-77.ap-southeast-2.compute.amazonaws.com:~

# extract the file and execute the installer follow the prompt to finish the installation
tar -zxvf puppet-enterprise-2018.1.2-el-7-x86_64.tar.gz

#Run the command below to start the puppet services
puppet resource service puppetserver ensure=running

puppet resource service puppetserver enable=true
```
  

Now go to the public DNS of the t2 Medium instance in my case it would be  
```
https://ec2-13-420-00-00.ap-southeast-2.compute.amazonaws.com/
# Note the https protocol handler — the puppet master cannot be reach over plain http
```
On the page should present you with the Puppet Login Console
![Puppet Login Console](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/pConsole.png)

Enter your login credentials that you have setup along the prompt installation and it should
bring you to 
![Puppet Home](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/pHome.png)

#### Go into puppet module directory and create a puppet module

```
cd /etc/puppetlabs/code/environments/production/manifests

# describe the package you would like to install inside the file
touch cpa2-module.pp
```
_There is a shorthand version of describing the package but for the assignment purpose I will
describe each step explicitly_  

Add more package base on you needs
```
class cpa2_python {

exec { 'apt-update':
  command => '/usr/bin/apt-get update'
}

package { 'vim':
  ensure => present,
}

package { 'htop':
  ensure => present,
}

package { 'python3-pip':
  ensure => present,
}

package { 'python3-venv':
  ensure => present,
}

package { 'git-core':
  ensure => present,
}

package { 'curl':
  ensure => present,
}
```

Now head over to t2 small instance and execute
```bash
curl -k https://ec2-13-237-72-77.ap-southeast-2.compute.amazonaws.com:8140/packages

/current/install.bash | sudo bash
```

This will configure the instance as Puppet agent that manage under the Puppet master that we
configure above.
Head back to the Puppet console and select the Puppet agent then select 
classification > configuration > and search for the module that we just create.
And click commit one change.
![Puppt add module](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/pAddModule.png)

#### Apply the change
```bash
puppet agent apply --test
```
After the process complete, all the package that you describe inside the module will be install on
the instance. 
___
## User Manual Walkthrough

_Some of the features from the apps are shown below_
#### Currency was extract from Blockchain
![Blockchain](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/bitconValue.png)

#### Search available meetup location
By entering address
![Location1](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/location_search.png)

When user click on an icon it will bring up a pop up with the details of the meetup
include the address, time and host. User can click subscribe and it will bring user to a page
where they can sign up for weekly news
![Location2](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/location_popup.png)

#### Google Cloud Studio - Data Visualization
The graph show the number of user that has sign up base on each
different day
![Graph](https://github.com/yelbmew/Crypto-Community/blob/master/doc_images/graph.png)
