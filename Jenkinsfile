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

    }
}
