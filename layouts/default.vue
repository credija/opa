<template>
  <div class="default">
    <el-container>
      <el-main>
        <nuxt />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
@media (max-height: 700px) {
  .el-main {
    padding: 0px;
  }
}

@media (max-height: 650px) {
  .el-main {
    overflow-x: hidden !important;
  }
}
</style>
