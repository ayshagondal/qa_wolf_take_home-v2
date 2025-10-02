# Start from the official Microsoft Playwright image, which has all browsers and dependencies pre-installed.
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Set the working directory inside the container.
WORKDIR /app

# Copy the package files and install dependencies first.
# This leverages Docker's layer caching, so 'npm install' only runs when dependencies change.
COPY package*.json ./
RUN npm ci

# Copy the rest of your project code into the container.
COPY . .

# Install the Allure command-line tool inside the container.
RUN apt-get update && apt-get install -y openjdk-11-jre
RUN wget https://github.com/allure-framework/allure2/releases/download/2.27.0/allure-2.27.0.tgz
RUN tar -zxvf allure-2.27.0.tgz -C /opt/
ENV PATH="/opt/allure-2.27.0/bin:${PATH}"

# Set the default command to run when the container starts.
# This will execute your full test and reporting script.
CMD [ "npm", "run", "test:report" ]