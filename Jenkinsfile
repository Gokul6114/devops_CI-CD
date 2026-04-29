pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                bat 'npm install'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t mern-app .'
            }
        }

        stage('Docker Run') {
            steps {
                
                bat 'docker stop mern-container || exit 0'
                bat 'docker rm mern-container || exit 0'

                
                bat 'docker run -d -p 3001:3000 -p 5174:5173 -p 5001:5000 --name mern-container mern-app'
            }
        }

    }
}
