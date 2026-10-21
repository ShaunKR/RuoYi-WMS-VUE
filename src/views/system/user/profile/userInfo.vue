<template>
   <el-form ref="userRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="사용자 별명" prop="nickName">
         <el-input v-model="user.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="휴대전화 번호" prop="phonenumber">
         <el-input v-model="user.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="이메일" prop="email">
         <el-input v-model="user.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="성별">
         <el-radio-group v-model="user.sex">
            <el-radio label="0">남성</el-radio>
            <el-radio label="1">여성</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">저장</el-button>
      <el-button type="danger" @click="close">닫기</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const rules = ref({
  nickName: [{ required: true, message: "사용자 별명항목은 필수입니다.", trigger: "blur" }],
  email: [{ required: true, message: "이메일 주소항목은 필수입니다.", trigger: "blur" }, { type: "email", message: "올바른 이메일 주소를 입력해 주세요.", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "휴대전화 번호항목은 필수입니다.", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "올바른 휴대전화 번호를 입력해 주세요.", trigger: "blur" }],
});

/** 저장버튼 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(props.user).then(response => {
        proxy.$modal.msgSuccess("수정되었습니다.");
      });
    }
  });
};
/** 닫기버튼 */
function close() {
  proxy.$tab.closePage();
};
</script>
