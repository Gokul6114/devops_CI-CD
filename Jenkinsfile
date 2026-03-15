pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test || true'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t mern-app .'
            }
        }

    }
}
