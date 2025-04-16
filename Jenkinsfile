pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "quang1709/mos-be:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test Application') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
                }
                sh "docker push ${DOCKER_IMAGE}"
            }
        }

        stage('Update Manifests') {
            steps {
                dir('manifests') {
                    checkout([$class: 'GitSCM', branches: [[name: 'main']], userRemoteConfigs: [[url: 'https://github.com/your-org/mos-be-manifests.git', credentialsId: 'github-credentials']]])

                    sh "sed -i 's|image: quang1709/mos-be:.*|image: ${DOCKER_IMAGE}|' deployment.yaml"

                    sh '''
                        if ! git diff --quiet; then
                            git config user.email "jenkins@example.com"
                            git config user.name "Jenkins"
                            git add deployment.yaml
                            git commit -m "Update image to ${BUILD_NUMBER}"
                            git push
                        fi
                    '''
                }
            }
        }
    }
}