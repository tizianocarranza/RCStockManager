<script>
	import { eyeClosed, eyeOpen, login } from '$lib/icons';
	import { scale, fade, slide } from 'svelte/transition';

	let show = false;
</script>

<main
	class="relative flex flex-col gap-10 md:gap-15 xl:gap-20 items-center justify-center px-5 py-10 h-screen w-screen overflow-hidden text-white bg-animated-lights"
>
	<h1 class="shining-header text-3xl md:text-5xl xl:text-7xl text-wrap text-center w-full max-w-[600px]">Acceso de Administrador</h1>
	<form
		method="post"
		class="flex flex-col items-center justify-center gap-10 border-custom rounded-md w-full"
	>
		<div class="flex items-center gap-4">
			<div class="input-with-icon__container input-with-icon__container--large">
				<input
					class="input-with-icon__input"
					type={show ? 'text' : 'password'}
					id="password"
					name="password"
					placeholder="Ingrese la contraseña"
				/>
				<button type="button" class="input-with-icon__button" on:click={() => (show = !show)}>
					{#if show}
						<img
							src={eyeOpen}
							alt="Ocultar contraseña"
							class="input-with-icon__icon"
							in:scale={{ start: 0.75, duration: 150 }}
						/>
					{:else}
						<img
							src={eyeClosed}
							alt="Eye open icon"
							class="input-with-icon__icon"
							in:scale={{ start: 0.75, duration: 150 }}
						/>
					{/if}
				</button>
			</div>
			<button
				type="submit"
				class="group flex items-center justify-center
				       rounded-full px-4 py-1
				       bg-white/10 hover:bg-white/20
				       transition-all duration-200
				       hover:-translate-y-0.5 active:translate-y-0"
			>
				<img
					src={login}
					alt="Login"
					class="w-8 h-8 opacity-80 group-hover:opacity-100 transition"
				/>
			</button>
		</div>
	</form>
</main>
