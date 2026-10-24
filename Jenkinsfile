pipeline {
    agent any

    environment {
        IMAGE_NAME = "newus3r/brightz-academy"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        APP_DIR    = "/home/ubuntu/Brightz-Academy"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Code pulled from GitHub"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build \
                        --build-arg VITE_API_BASE_URL=/api \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
                echo "Docker image built successfully"
            }
        }

        stage('Test') {
            steps {
                echo "Build verified - Image: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker image inspect ${IMAGE_NAME}:${IMAGE_TAG} | grep -i size"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        echo "Image pushed to Docker Hub"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    cd ${APP_DIR}
                    docker compose down --remove-orphans || true
                    docker compose up -d
                    sleep 15
                    docker compose ps
                """
                echo "Brightz Academy deployed!"
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS - Brightz Academy is LIVE!"
        }
        failure {
            echo "Pipeline FAILED - Check logs above"
        }
    }
}
