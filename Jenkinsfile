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
              newus3r/brightz-academy:latest
            sleep 15
            docker ps
            docker logs --tail 30 brightz-app
        '''
    }
}
