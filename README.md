# 콜렉터 라이브러리 백엔드

이 프로젝트는 콜렉터들을 위한 디지털 라이브러리 시스템의 백엔드 부분입니다. TypeScript와 Express.js를 기반으로 구축되었으며, RESTful API를 제공합니다.

## 주요 기능

- 사용자 인증 및 권한 관리 API
- 콜렉션 아이템 CRUD 작업
- 검색 및 필터링 기능
- 데이터베이스 연동 (MySQL)
- OCR 처리를 위한 Google Cloud Vision API 연동

## 기술 스택

- TypeScript
- Express.js
- MySQL
- JSON Web Tokens (인증)
- Google Cloud Vision API (OCR)

## 요구사항

- Node.js 18.17.1
- Yarn Berry

## 설치 방법

1. 저장소를 클론합니다:
   ```
   git clone https://github.com/your-username/collector-library-backend.git
   ```
2. 프로젝트 디렉토리로 이동합니다:
   ```
   cd collector-library-backend
   ```
3. Yarn Berry를 활성화합니다:
   ```
   yarn set version berry
   ```
4. 의존성을 설치합니다:
   ```
   yarn install
   ```
5. .env 파일을 생성하고 필요한 환경 변수를 설정합니다:


## 주의사항

- 이 프로젝트는 Node.js 18.17.1 버전에서 테스트되었습니다. 다른 버전을 사용할 경우 호환성 문제가 발생할 수 있습니다.
- Yarn Berry를 사용하므로, npm이나 기존 Yarn을 사용하지 마세요.
- 다음 모듈들의 버전에 주의해주세요:
  - express: ^4.18.2
  - typescript: ^5.1.6
  - mysql2: ^3.6.0
  - jest: ^29.6.4
- 의존성 설치 후 `yarn dlx @yarnpkg/doctor`를 실행하여 잠재적인 문제를 확인하세요.
- TypeScript 프로젝트이므로 `tsconfig.json` 파일의 설정을 확인하세요.

## 사용 방법

개발 서버를 실행하려면:
```
yarn start
```
서버는 `http://localhost:3003`에서 실행됩니다.

... (이하 생략)

---

# Collector Library Backend

This project is the backend part of a digital library system for collectors. It is built using TypeScript and Express.js, providing RESTful APIs.

## Key Features

- User authentication and authorization API
- CRUD operations for collection items
- Search and filtering functionality
- Database integration (MySQL)
- Google Cloud Vision API integration for OCR processing

## Tech Stack

- TypeScript
- Express.js
- MySQL
- Jest (Testing)
- JSON Web Tokens (Authentication)
- Google Cloud Vision API (OCR)

## Requirements

- Node.js 18.17.1
- Yarn Berry

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/collector-library-backend.git
   ```
2. Navigate to the project directory:
   ```
   cd collector-library-backend
   ```
3. Enable Yarn Berry:
   ```
   yarn set version berry
   ```
4. Install dependencies:
   ```
   yarn install
   ```
5. Create a `.env` file and set up the necessary environment variables:

## Important Notes

- This project has been tested with Node.js 18.17.1. Using other versions may cause compatibility issues.
- Use Yarn Berry for package management. Do not use npm or classic Yarn.
- Pay attention to the following module versions:
  - express: ^4.18.2
  - typescript: ^5.1.6
  - mysql2: ^3.6.0
  - jest: ^29.6.4
- After installing dependencies, run `yarn dlx @yarnpkg/doctor` to check for potential issues.
- As this is a TypeScript project, make sure to check the settings in `tsconfig.json`.

## Usage

To run the development server:
```
yarn start
```
The server will run on `http://localhost:3003`.

... (rest of the content remains the same)
