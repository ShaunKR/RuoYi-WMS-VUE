<template>
  <div class="errPage-container">
    <el-button icon="arrow-left" class="pan-back-btn" @click="back">
      돌아가기
    </el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">
          401 접근 권한 없음
        </h1>
        <h2>이 페이지에 접근할 권한이 없습니다.</h2>
        <h6>접근 권한을 확인하거나 홈 화면으로 돌아가 주세요.</h6>
        <ul class="list-unstyled">
          <li class="link-type">
            <router-link to="/">
              홈으로 돌아가기
            </router-link>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import errImage from "@/assets/401_images/401.gif";

let { proxy } = getCurrentInstance();

const errGif = ref(errImage + "?" + +new Date());

function back() {
  if (proxy.$route.query.noGoBack) {
    proxy.$router.push({ path: "/" });
  } else {
    proxy.$router.go(-1);
  }
}
</script>

<style lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }
  .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .list-unstyled {
    font-size: 14px;
    li {
      padding-bottom: 5px;
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
