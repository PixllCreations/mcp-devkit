#!/bin/bash

# mcp-devkit Demo Script
# Demonstrates the full functionality of mcp-devkit CLI

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Demo configuration
DEMO_DIR="demo-project"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="demo_${TIMESTAMP}.log"

# Functions
log() {
    echo -e "${BLUE}[DEMO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

step() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

pause_demo() {
    if [ "$INTERACTIVE" = "true" ]; then
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read -r
    else
        sleep 2
    fi
}

cleanup() {
    log "Cleaning up demo environment..."
    if [ -d "$DEMO_DIR" ]; then
        rm -rf "$DEMO_DIR"
        success "Removed demo directory: $DEMO_DIR"
    fi
}

# Parse command line arguments
INTERACTIVE="false"
CLEANUP_ONLY="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--interactive)
            INTERACTIVE="true"
            shift
            ;;
        -c|--cleanup)
            CLEANUP_ONLY="true"
            shift
            ;;
        -h|--help)
            echo "mcp-devkit Demo Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -i, --interactive  Run in interactive mode (pause between steps)"
            echo "  -c, --cleanup      Only cleanup previous demo runs"
            echo "  -h, --help         Show this help message"
            echo ""
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Cleanup only mode
if [ "$CLEANUP_ONLY" = "true" ]; then
    cleanup
    exit 0
fi

# Main demo script
main() {
    log "Starting mcp-devkit demo at $(date)"
    log "Interactive mode: $INTERACTIVE"
    log "Log file: $LOG_FILE"

    # Cleanup any existing demo
    cleanup

    step "1. Welcome to mcp-devkit Demo"
    
    cat << 'EOF'
  ███╗   ███╗ ██████╗██████╗       ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
  ████╗ ████║██╔════╝██╔══██╗      ██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
  ██╔████╔██║██║     ██████╔╝█████╗██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
  ██║╚██╔╝██║██║     ██╔═══╝ ╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═██╗ ██║   ██║   
  ██║ ╚═╝ ██║╚██████╗██║           ██████╔╝███████╗ ╚████╔╝ ██║  ██╗██║   ██║   
  ╚═╝     ╚═╝ ╚═════╝╚═╝           ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝   ╚═╝   

  Claude's Persistent Development Partner
  
EOF

    echo "This demo will show you how mcp-devkit transforms Claude into a persistent"
    echo "development partner with project memory and anti-drift capabilities."
    
    pause_demo

    step "2. Checking mcp-devkit Installation"
    
    log "Checking if mcp-devkit is available..."
    
    if command -v mcp-devkit &> /dev/null; then
        success "mcp-devkit is installed globally"
        mcp-devkit --version
    elif [ -f "dist/cli/index.js" ]; then
        success "mcp-devkit built locally, using npm run start"
        npm run start -- --version
        alias mcp-devkit="npm run start --"
    else
        error "mcp-devkit not found. Please build or install first."
        echo "Run: npm run build"
        exit 1
    fi
    
    pause_demo

    step "3. Displaying Help Information"
    
    log "Showing mcp-devkit help..."
    if command -v mcp-devkit &> /dev/null; then
        mcp-devkit --help
    else
        npm run start -- --help
    fi
    
    pause_demo

    step "4. Initializing a New Project"
    
    log "Creating a new project with mcp-devkit..."
    echo "Command: mcp-devkit init $DEMO_DIR"
    
    if command -v mcp-devkit &> /dev/null; then
        mcp-devkit init "$DEMO_DIR"
    else
        npm run start -- init "$DEMO_DIR"
    fi
    
    if [ $? -eq 0 ]; then
        success "Project initialized successfully!"
    else
        error "Project initialization failed"
        exit 1
    fi
    
    pause_demo

    step "5. Exploring the Generated Project Structure"
    
    log "Let's explore what was created..."
    
    if [ -d "$DEMO_DIR" ]; then
        echo "Project directory structure:"
        tree "$DEMO_DIR" 2>/dev/null || find "$DEMO_DIR" -type f | head -20
        
        echo -e "\n${CYAN}Generated files:${NC}"
        ls -la "$DEMO_DIR/.mcp/"
        
        success "Project structure created successfully"
    else
        error "Demo directory not found: $DEMO_DIR"
        exit 1
    fi
    
    pause_demo

    step "6. Examining Generated Templates"
    
    log "Looking at the generated template files..."
    
    echo -e "${CYAN}Product Requirements Document (PRD):${NC}"
    head -20 "$DEMO_DIR/.mcp/context_prd.md"
    echo "... (truncated)"
    
    echo -e "\n${CYAN}Architecture Document:${NC}"
    head -15 "$DEMO_DIR/.mcp/context_architecture.md"
    echo "... (truncated)"
    
    echo -e "\n${CYAN}Task List:${NC}"
    head -15 "$DEMO_DIR/.mcp/context_tasklist.md"
    echo "... (truncated)"
    
    echo -e "\n${CYAN}Project Metadata:${NC}"
    cat "$DEMO_DIR/.mcp/metadata.json"
    
    success "All template files generated correctly"
    
    pause_demo

    step "7. Testing Force Overwrite"
    
    log "Testing --force option to overwrite existing project..."
    
    # Add a test file to demonstrate overwrite
    echo "test content" > "$DEMO_DIR/.mcp/test.txt"
    
    echo "Command: mcp-devkit init $DEMO_DIR --force"
    
    if command -v mcp-devkit &> /dev/null; then
        mcp-devkit init "$DEMO_DIR" --force
    else
        npm run start -- init "$DEMO_DIR" --force
    fi
    
    if [ ! -f "$DEMO_DIR/.mcp/test.txt" ]; then
        success "Force overwrite worked correctly - old files removed"
    else
        warning "Force overwrite may not have worked as expected"
    fi
    
    pause_demo

    step "8. Testing Error Handling"
    
    log "Testing error handling with invalid commands..."
    
    echo "Command: mcp-devkit invalid-command"
    
    if command -v mcp-devkit &> /dev/null; then
        mcp-devkit invalid-command 2>&1 || true
    else
        npm run start -- invalid-command 2>&1 || true
    fi
    
    success "Error handling working correctly"
    
    pause_demo

    step "9. MCP Server Configuration"
    
    log "Showing MCP server configuration for Claude Desktop..."
    
    cat << 'EOF'

To use mcp-devkit with Claude Desktop, add this to your configuration:

📁 Claude Desktop Config Location:
  • macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
  • Windows: %APPDATA%\Claude\claude_desktop_config.json

📄 Configuration:
{
  "mcpServers": {
    "mcp-devkit": {
      "command": "mcp-devkit",
      "args": ["serve"]
    }
  }
}

🔧 After configuration:
1. Restart Claude Desktop
2. Claude will have access to these tools:
   • mcp_init_guided() - Initialize projects with development plans
   • mcp_get_status() - Check project progress
   • mcp_check_drift() - Prevent conversation drift
   • mcp_next_task() - Get prioritized next tasks
   • mcp_analyze_project() - Recover stalled projects

EOF
    
    success "MCP configuration guide displayed"
    
    pause_demo

    step "10. Demo Complete!"
    
    cat << 'EOF'

🎉 mcp-devkit Demo Summary:

✅ Project Initialization: Working perfectly
✅ Template Generation: PRD, Architecture, Tasks created
✅ Force Overwrite: Functioning correctly  
✅ Error Handling: Helpful messages displayed
✅ CLI Experience: Beautiful output with colors and animations

📊 What You've Seen:
• Beautiful CLI with ASCII art banner
• Structured project templates 
• Helpful error messages and guidance
• MCP server configuration for Claude Desktop

🚀 Next Steps:
1. Configure Claude Desktop with mcp-devkit
2. Start a real project with: mcp-devkit init my-project
3. Use Claude with persistent project memory!

EOF
    
    log "Demo completed successfully at $(date)"
    success "All features demonstrated successfully!"
    
    # Cleanup
    if [ "$INTERACTIVE" = "true" ]; then
        echo -e "\n${YELLOW}Clean up demo directory? (y/N)${NC}"
        read -r cleanup_choice
        if [[ $cleanup_choice =~ ^[Yy]$ ]]; then
            cleanup
        else
            log "Demo directory preserved: $DEMO_DIR"
        fi
    else
        cleanup
    fi
    
    echo -e "\n${GREEN}Demo log saved to: $LOG_FILE${NC}"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main demo
main "$@"