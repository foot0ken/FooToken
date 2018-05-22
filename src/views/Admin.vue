<template>
  <div class="admin">
    <h3>This is an admin page</h3>
    <TokenSaleAdmin/>
  </div>
</template>

<script>
import TokenSaleAdmin from '../components/TokenSaleAdmin.vue'

export default {
  name: 'admin',
  components: {
    TokenSaleAdmin
  }
}
</script>
