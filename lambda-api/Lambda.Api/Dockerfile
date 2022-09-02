FROM public.ecr.aws/lambda/dotnet:6 AS base

FROM mcr.microsoft.com/dotnet/sdk:6.0-bullseye-slim as build
WORKDIR /src
COPY ["Lambda.Api.csproj", "Lambda.Api/"]
RUN dotnet restore "Lambda.Api/Lambda.Api.csproj"

WORKDIR "/src/Lambda.Api"
COPY . .
RUN dotnet build "Lambda.Api.csproj" --configuration Release --output /app/build

FROM build AS publish
RUN dotnet publish "Lambda.Api.csproj" \
    --configuration Release \ 
    --runtime linux-x64 \
    --self-contained false \ 
    --output /app/publish \
    -p:PublishReadyToRun=true  

FROM base AS final
WORKDIR /var/task
COPY --from=publish /app/publish .
CMD [ "Lambda.Api::Lambda.Api.LambdaEntryPoint::FunctionHandlerAsync" ]