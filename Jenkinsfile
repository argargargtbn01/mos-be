pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "quang1709/mos-be:latest"
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        KUBE_CONFIG_ID = 'kubeconfig-credentials'
        DEPLOYMENT_NAME = 'mos-be-kltn-service'
        DEPLOYMENT_NAMESPACE = 'argocd'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        // stage('Lint Check') {
        //     steps {
        //         sh 'npm run lint'
        //     }
        // }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        // stage('Test Application') {
        //     steps {
        //         sh 'npm test'
        //     }
        // }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        // stage('Deploy to Kubernetes') {
        //     steps {
        //         withCredentials([file(credentialsId: "${KUBE_CONFIG_ID}", variable: 'KUBECONFIG')]) {
        //             sh "kubectl --kubeconfig=$KUBECONFIG set image deployment/${DEPLOYMENT_NAME} ${DEPLOYMENT_NAME}=quang1709/mos-be:la
        // test -n ${DEPLOYMENT_NAMESPACE}"
        //             sh "kubectl --kubeconfig=$KUBECONFIG rollout status deployment/${DEPLOYMENT_NAME} -n ${DEPLOYMENT_NAMESPACE}"
        //         }
        //     }
        // }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'CI/CD pipeline failed. Please check the logs for details.'
        }
        always {
            // Clean up to save disk space
            sh 'docker system prune -f'
        }
    }
}