workflow "New workflow" {
  on = "push"
  resolves = ["Test", "lint"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  runs = "install"
}

action "Test" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["GitHub Action for npm"]
  runs = "test"
}

action "lint" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["GitHub Action for npm"]
  runs = "lint"
}
