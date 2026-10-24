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
                sh 'docker build --platform linux/amd64 --build-arg VITE_API_BASE_URL=/api -t $IMAGE:$BUILD_NUMBER -t $IMAGE:latest .'
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
                      -e DJANGO_ALLOWED_HOSTS=13.239.9.221,localhost \
                      -e DEBUG=False \
                      $IMAGE:latest
                    sleep 15
                    docker ps
                    docker logs --tail 30 brightz-app
                '''
            }
        }
    }

    post {
        success { echo 'Pipeline succeeded - app deployed' }
        failure { echo 'Pipeline FAILED - Check logs above' }
    }
}
