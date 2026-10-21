# RuoYi WMS 프런트엔드 — 한국어 Fork

RuoYi 기반 창고 관리 시스템의 프런트엔드입니다. 이 Fork는 화면의 고정 문구, 메뉴·상태 표시명, 기본 UI를 한국어로 적용했습니다.

한국어 화면 적용 범위와 검증 내용은 [한국어 화면 문서](docs/localization.ko.md)를 참고하세요. 등록된 상품명·창고명 등의 데이터와 기존 이미지는 원문을 유지합니다.

## 연결할 백엔드

- [한국어 백엔드 Fork](https://github.com/ShaunKR/wms-ruoyi/tree/portfolio/korean-ui)
- [원본 백엔드 — GitHub](https://github.com/zccbbg/wms-ruoyi)
- [원본 백엔드 — Gitee](https://gitee.com/zccbbg/wms-ruoyi)

프런트엔드와 백엔드 모두 `portfolio/korean-ui` 브랜치를 사용하세요.

## 원본 온라인 데모

[원본 WMS 데모](https://wms.ichengle.top/)

아래 이미지는 원본 프로젝트의 미니 프로그램 안내입니다.

| 미니 프로그램 |
|:---:|
| <img src="docs/xcx.jpg" width="200px"> |

## 원본 브랜치 안내

| 브랜치 | 구성 및 특징 |
|---|---|
| `master` | Java 17·Vue 3 기반. 다중 창고를 지원하며 창고 구역 개념을 제외한 간단한 재고 관리 구성입니다. |
| `advance` | Java 17·Vue 3 기반. 다중 창고·창고 구역, 생산일·유효기간·시리얼번호를 지원하며 개별 식별 코드 관리에 활용할 수 있습니다. |
| `v1` | Java 8·Vue 2 기반의 이전 버전입니다. |

위 표는 원본 저장소의 브랜치 설명이며, 이 Fork에는 모든 원본 브랜치가 포함된 것은 아닙니다.

## 프런트엔드 실행

Node.js 20과 실행 중인 백엔드가 필요합니다. 한국어 Fork의 로컬 실행 예시는 다음과 같습니다.

```bash
# 프로젝트 폴더로 이동
cd RuoYi-WMS-VUE

# 의존성 설치
npm install --registry=https://registry.npmjs.org

# 개발 서버 실행
npm run dev -- --host 127.0.0.1 --port 5175 --open false

# 프로덕션 빌드
npm run build:prod
```

브라우저에서 [로컬 WMS](http://127.0.0.1:5175/)를 엽니다. 해당 포트가 사용 중이면 Vite가 출력하는 실제 주소를 확인하세요.
개발 서버의 `/dev-api` 요청은 `http://127.0.0.1:8080` 백엔드로 전달됩니다.

백엔드·MySQL·Redis 준비 방법은 [백엔드 실행 문서](https://github.com/ShaunKR/wms-ruoyi/blob/portfolio/korean-ui/docs/portfolio/run.ko.md)를 참고하세요.

## 원본 화면 예시

이미지는 원본 그대로 유지합니다. 현재 한국어 화면과 문구가 다를 수 있습니다.

![首页](docs/首页.png)
![大屏](docs/大屏.png)
![入库单](docs/入库单.jpg)
![编辑入库单](docs/编辑入库单.jpg)
![打印](docs/打印.jpg)
![库存盘点](docs/库存盘点.jpg)
![库存统计](docs/库存统计.jpg)
![库存明细](docs/库存明细.jpg)
![库存记录](docs/库存记录.jpg)

## 원본 프로젝트에 기여하기

원본 프로젝트는 `dev` 개발 브랜치로 PR을 제출하여 통합 테스트와 배포를 진행하도록 안내하고 있습니다.

## 원본 개발팀 소개

원본 개발팀은 2017년에 설립되었으며 프런트엔드와 백엔드 아키텍처를 개발합니다. 기업용 공통 UI와 사용자 경험을 개선하고, 지속적으로 오픈소스 프로젝트를 제공하는 것을 목표로 합니다.

이 소개는 원본 개발팀에 관한 내용입니다. 한국어 Fork의 작업 내용은 위 한국어 화면 문서에서 확인할 수 있습니다.

## 원본 개발팀의 위챗 공식 계정

| 위챗 공식 계정 |
|:---:|
| <img src="docs/gzh.jpg" width="200px"> |
