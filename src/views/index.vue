<template>
  <div class="app-container home">
    <el-alert title="아래 내용은 원본 개발팀의 프로젝트 소개입니다." type="info" :closable="false" show-icon />
    <el-row class="pl20 pr20 pb20 pt20" :gutter="10">
      <el-col :span="12">
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">원본 개발팀의 SaaS 버전 안내</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              설치 없이 자동 업데이트되는 경량 재고 관리 도구로, 입고·출고·스캔·상품·재고·공급업체·정산 기능을 통합합니다.
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="font-size: 14px">
          <div slot="header">
            <span style="font-size: large;font-weight: bold">더 보기</span>
          </div>
          <div>
            <div style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              <div>
                <span style="font-size: large;font-weight: bold">v2 advance미리보기：</span><a href="http://kucun.ichengle.top/" target="_blank">http://kucun.ichengle.top/</a>
              </div>
              <div>
                <span style="font-size: large;font-weight: bold">v1.0미리보기：</span><a href="http://wms.ichengle.top/" target="_blank">http://wms.ichengle.top/</a>
              </div>
              <div>
                <span style="font-size: large;font-weight: bold">기능 설명 영상：</span><a href="https://www.bilibili.com/video/BV1ys4y1q7uG/" target="_blank">https://www.bilibili.com/video/BV1ys4y1q7uG/</a>
              </div>
              <div>
                <span style="font-size: large;font-weight: bold">RuoYi 실습 영상：</span><a href="https://www.bilibili.com/video/BV1Fi4y1q74p/" target="_blank">https://www.bilibili.com/video/BV1Fi4y1q74p/</a>
              </div>
            </div>
          </div>

        </el-card>

      </el-col>
    </el-row>
    <el-row class="pl20 pr20" :gutter="10">
      <el-col :span="12">
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px;margin-bottom: 20px; margin-top: 20px" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">원본 개발팀의 풀스택 개발자 모집 안내</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              Java 17과 Vue 3 기반 ruoyi-mall 및 ruoyi-erp 개발에 참여합니다.<br>
              RuoYi 프레임워크와 관련 프로젝트에 대한 이해 및 참여 시간이 필요합니다.<br>
              정규직, 파트타임, 인턴 참여가 가능하며 쑤저우 현장 또는 원격으로 참여할 수 있습니다.<br>
              관심이 있다면 원본 개발팀의 위챗 공식 계정에 지원 의사를 전달하세요.<br>
            </div>
          </div>
        </el-card>
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px;margin-bottom: 20px;" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">원본 개발팀의 콘텐츠 운영자 모집 안내</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              ruoyi-wms, ruoyi-mall, ruoyi-erp 프로젝트의 콘텐츠 운영에 참여합니다.<br>
              짧은 영상이나 위챗 게시물 편집 경험과 프로젝트에 대한 이해가 필요합니다.<br>
              정규직, 파트타임, 인턴 참여가 가능하며 쑤저우 현장 또는 원격으로 참여할 수 있습니다.<br>
              관심이 있다면 원본 개발팀의 위챗 공식 계정에 지원 의사를 전달하세요.<br>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="padding-bottom: 20px; font-size: 14px">
          <div slot="header">
            <span style="font-size: large;font-weight: bold">원본 개발팀의 프로젝트 연혁</span>
          </div>
          <div style="padding-top: 20px">
            <el-timeline >
              <el-timeline-item placement="top" timestamp="2018년">
                <el-card>
                  <h4>징둥 서비스 마켓의 상품 분석 및 회원 포인트 앱 개발 참여</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2019년">
                <el-card>
                  <h4>징둥 상품 이전 앱 및 핀둬둬 주문 앱 개발 참여</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2020년">
                <el-card>
                  <h4>핀둬둬 주문 앱의 마켓 카테고리 1위 달성 및 콰이쇼우 주문 앱 개발 시작</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2021년">
                <el-card>
                  <h4>핀둬둬 주문 일일 200만 건 처리, 메이퇀·어러머 앱 개발 시작</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2022년">
                <el-card>
                  <h4>전자상거래 매장 10만 곳 및 배달 매장 5만 곳에 서비스 제공. 더우인·타오바오 주문 앱 개발 및 ruoyi-wms 공개</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2023년">
                <el-card>
                  <h4>빌리빌리 조회수와 위챗 구독자 1만 달성, ruoyi-mall 공개 및 WMS SaaS 개발</h4>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('5.2.0')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

