<!-- 
  SocialShare.vue
  A component for sharing company profiles on social media
-->
<template>
  <div class="social-share">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="social-share-button"
          v-bind="attrs"
          v-on="on"
          :color="color"
          :icon="icon"
          :text="text"
          :outlined="outlined"
          :small="small"
          :x-small="xSmall"
          :large="large"
        >
          <v-icon v-if="showIcon" left>{{ buttonIcon }}</v-icon>
          <span v-if="!icon">{{ buttonText }}</span>
        </v-btn>
      </template>
      
      <v-card>
        <v-card-title>
          Share {{ title }}
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <!-- Facebook -->
            <v-list-item
              @click="shareToFacebook"
              link
            >
              <template v-slot:prepend>
                <v-icon color="#3b5998">mdi-facebook</v-icon>
              </template>
              <v-list-item-title>Facebook</v-list-item-title>
            </v-list-item>
            
            <!-- Twitter -->
            <v-list-item
              @click="shareToTwitter"
              link
            >
              <template v-slot:prepend>
                <v-icon color="#1DA1F2">mdi-twitter</v-icon>
              </template>
              <v-list-item-title>Twitter</v-list-item-title>
            </v-list-item>
            
            <!-- LinkedIn -->
            <v-list-item
              @click="shareToLinkedIn"
              link
            >
              <template v-slot:prepend>
                <v-icon color="#0077B5">mdi-linkedin</v-icon>
              </template>
              <v-list-item-title>LinkedIn</v-list-item-title>
            </v-list-item>
            
            <!-- WhatsApp -->
            <v-list-item
              @click="shareToWhatsApp"
              link
            >
              <template v-slot:prepend>
                <v-icon color="#25D366">mdi-whatsapp</v-icon>
              </template>
              <v-list-item-title>WhatsApp</v-list-item-title>
            </v-list-item>
            
            <!-- Email -->
            <v-list-item
              @click="shareViaEmail"
              link
            >
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title>Email</v-list-item-title>
            </v-list-item>
            
            <!-- Copy Link -->
            <v-list-item
              @click="copyLink"
              link
            >
              <template v-slot:prepend>
                <v-icon>mdi-content-copy</v-icon>
              </template>
              <v-list-item-title>Copy Link</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <!-- URL Input for Copy -->
          <v-text-field
            v-model="shareUrl"
            label="Share URL"
            readonly
            outlined
            dense
            hide-details
            class="mt-4"
            append-icon="mdi-content-copy"
            @click:append="copyLink"
          ></v-text-field>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="menu = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    
    <!-- Snackbar for copy confirmation -->
    <v-snackbar
      v-model="showCopySnackbar"
      :timeout="2000"
      bottom
      right
      color="success"
    >
      Link copied to clipboard!
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showCopySnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'SocialShare',
  
  props: {
    // URL to share
    url: {
      type: String,
      required: true
    },
    
    // Title of the content
    title: {
      type: String,
      default: 'this content'
    },
    
    // Description for sharing
    description: {
      type: String,
      default: ''
    },
    
    // Button text
    buttonText: {
      type: String,
      default: 'Share'
    },
    
    // Button icon
    buttonIcon: {
      type: String,
      default: 'mdi-share-variant'
    },
    
    // Show icon with text
    showIcon: {
      type: Boolean,
      default: true
    },
    
    // Button styles
    color: {
      type: String,
      default: 'primary'
    },
    
    // Button is icon only
    icon: {
      type: Boolean,
      default: false
    },
    
    // Button is text only
    text: {
      type: Boolean,
      default: false
    },
    
    // Button is outlined
    outlined: {
      type: Boolean,
      default: false
    },
    
    // Button sizes
    small: {
      type: Boolean,
      default: false
    },
    
    xSmall: {
      type: Boolean,
      default: false
    },
    
    large: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      menu: false,
      showCopySnackbar: false,
      shareUrl: ''
    };
  },
  
  created() {
    // Initialize share URL
    this.shareUrl = this.url;
  },
  
  methods: {
    // Share to Facebook
    shareToFacebook() {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url)}&quote=${encodeURIComponent(this.description || this.title)}`;
      this.openShareWindow(url);
      this.trackShare('facebook');
    },
    
    // Share to Twitter
    shareToTwitter() {
      const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.url)}&text=${encodeURIComponent(this.description || this.title)}`;
      this.openShareWindow(url);
      this.trackShare('twitter');
    },
    
    // Share to LinkedIn
    shareToLinkedIn() {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.url)}`;
      this.openShareWindow(url);
      this.trackShare('linkedin');
    },
    
    // Share to WhatsApp
    shareToWhatsApp() {
      const text = `${this.title}: ${this.url}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      this.openShareWindow(url);
      this.trackShare('whatsapp');
    },
    
    // Share via Email
    shareViaEmail() {
      const subject = encodeURIComponent(this.title);
      const body = encodeURIComponent(`${this.description || this.title}\n\n${this.url}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      this.trackShare('email');
    },
    
    // Copy link to clipboard
    copyLink() {
      // Create a temporary input element
      const input = document.createElement('input');
      input.value = this.url;
      document.body.appendChild(input);
      input.select();
      
      // Copy to clipboard
      document.execCommand('copy');
      document.body.removeChild(input);
      
      // Show snackbar
      this.showCopySnackbar = true;
      
      // Close menu
      this.menu = false;
      
      // Track share
      this.trackShare('copy');
    },
    
    // Open share window
    openShareWindow(url) {
      window.open(url, '_blank', 'width=600,height=400');
      this.menu = false;
    },
    
    // Track share event
    trackShare(platform) {
      this.$emit('share', { platform, url: this.url, title: this.title });
    }
  },
  
  watch: {
    url(newUrl) {
      this.shareUrl = newUrl;
    }
  }
};
</script>

<style scoped>
.social-share {
  display: inline-block;
}
</style>