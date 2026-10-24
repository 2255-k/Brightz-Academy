pipeline {
    agent any

    environment {
        IMAGE = 'newus3r/brightz-academy'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code pulled from GitHub'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build --build-arg VITE_API_BASE_URL=/api -t $IMAGE:$BUILD_NUMBER -t $IMAGE:latest .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-credentials',
                                 usernameVariable: 'DOCKER_USER',
                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $IMAGE:$BUILD_NUMBER
                        docker push $IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f brightz-app || true
                    docker run -d --name brightz-app --network brightz-net \
                      --restart unless-stopped -p 80:80 \
                      -e DB_NAME=brightz -e DB_USER=brightz -e DB_PASSWORD=ChangeMe123 \
                      -e DB_HOST=brightz-db -e DB_PORT=5432 \
                      -e ALLOWED_HOSTS=13.239.9.221,localhost -e DB_ENGINE=postgres -e CORS_ALLOW_ALL_ORIGINS=True \
                      -e DEBUG=False \
                      $IMAGE:latest
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 15
                    docker ps --filter name=brightz-app --filter status=running | grep brightz-app
                    docker logs --tail 20 brightz-app
                '''
            }
        }
    }

    post {
        success { echo 'Pipeline succeeded - app deployed and running' }
        failure { echo 'Pipeline FAILED - Check logs above' }
    }
}
